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
            당신은 면접 준비 코치입니다. 사용자의 연습 답변 초안을 바탕으로,
            실제 면접에서 그대로 말할 수 있는 **답변 스크립트 한 편**으로 다듬어 주세요.

            내용 구성:
            - STAR(상황·과제·행동·결과)의 흐름이 자연스럽게 드러나도록 재구성합니다.
            - Situation, Task, Action, Result 같은 **소제목이나 머리글은 쓰지 마세요.**
            - 두괄식으로 앞에 요약 문단을 따로 두지 말고, 말하기에 맞는 순서로 이어지는 한 덩어리로 씁니다.
            - 면접관 앞에서 구두로 말하듯 자연스러운 문장과 호흡을 유지합니다.

            규칙:
            - 한국어로 출력합니다.
            - 사용자가 적은 사실을 왜곡하지 않고, 빠진 맥락은 합리적으로 보완합니다.
            - 결과(Result)는 가능하면 수치·변화·배운 점 등으로 구체화합니다.
            - 출력은 **완성된 답변 본문만** 주세요. 코멘트·메타 설명·인사말은 넣지 않습니다.
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
