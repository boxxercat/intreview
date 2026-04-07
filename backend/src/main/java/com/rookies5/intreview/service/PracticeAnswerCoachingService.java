package com.rookies5.intreview.service;

import com.rookies5.intreview.domain.preparation.PreparationQuestion;
import com.rookies5.intreview.dto.response.CoachPracticeAnswerResponse;
import com.rookies5.intreview.exception.ApiException;
import com.rookies5.intreview.exception.ErrorCode;
import com.rookies5.intreview.repository.PreparationQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PracticeAnswerCoachingService {

    @Value("${spring.ai.openai.api-key:}")
    private String groqApiKey;

    private static final String SYSTEM_PROMPT = """
            당신은 면접 준비 코치입니다. 사용자가 작성한 면접 질문에 대한 연습 답변을
            두괄식(요약)으로 시작하고, STAR 구조(Situation, Task, Action, Result)에 맞게 첨삭합니다.

            규칙:
            - 한국어로 출력합니다.
            - 먼저 1~2문장으로 핵심 요약(두괄)을 제시합니다.
            - 이어서 STAR에 맞게 각 항목을 소제목으로 구분하거나, 문단으로 구분합니다.
            - Situation, Task, Action, Result 라벨을 명시해도 좋습니다.
            - 사용자가 쓴 사실을 왜곡하지 말고, 부족한 부분은 보완 제안을 덧붙입니다.
            - 출력은 최종 답변만: 별도 메타 설명이나 "다음과 같이" 같은 프롬프트 반복은 피합니다.
            """;

    private final PreparationQuestionRepository preparationQuestionRepository;
    private final ObjectProvider<ChatModel> chatModelProvider;

    @Transactional(readOnly = true)
    public CoachPracticeAnswerResponse coach(long userId, long preparationQuestionId, String practiceAnswerDraft) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            throw new ApiException(ErrorCode.AI_NOT_CONFIGURED);
        }
        ChatModel chatModel = chatModelProvider.getIfAvailable();
        if (chatModel == null) {
            throw new ApiException(ErrorCode.AI_NOT_CONFIGURED);
        }

        PreparationQuestion pq = preparationQuestionRepository.findByIdAndOwner_Id(preparationQuestionId, userId)
                .orElseGet(() -> {
                    if (preparationQuestionRepository.existsById(preparationQuestionId)) {
                        throw new ApiException(ErrorCode.ACCESS_DENIED);
                    }
                    throw new ApiException(ErrorCode.PREPARATION_QUESTION_NOT_FOUND);
                });

        String draft = practiceAnswerDraft.trim();
        String question = pq.getQuestionTextSnapshot().trim();

        String userContent = """
                [면접 질문]
                %s

                [연습 답변 초안]
                %s
                """.formatted(question, draft);

        Prompt prompt = new Prompt(List.of(
                new SystemMessage(SYSTEM_PROMPT),
                new UserMessage(userContent)
        ));

        try {
            ChatResponse response = chatModel.call(prompt);
            String text = response.getResult().getOutput().getContent();
            if (text == null || text.isBlank()) {
                throw new ApiException(ErrorCode.AI_COACHING_FAILED);
            }
            return new CoachPracticeAnswerResponse(text.trim(), null);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(ErrorCode.AI_COACHING_FAILED, e.getMessage());
        }
    }
}
