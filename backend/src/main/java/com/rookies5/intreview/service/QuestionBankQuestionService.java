package com.rookies5.intreview.service;

import com.rookies5.intreview.domain.questionbank.QuestionBankQuestion;
import com.rookies5.intreview.domain.user.User;
import com.rookies5.intreview.dto.request.CreateQuestionBankQuestionRequest;
import com.rookies5.intreview.dto.request.PatchQuestionBankQuestionRequest;
import com.rookies5.intreview.dto.response.PageResponse;
import com.rookies5.intreview.dto.response.QuestionBankQuestionDetailResponse;
import com.rookies5.intreview.dto.response.QuestionBankQuestionSummaryResponse;
import com.rookies5.intreview.exception.ApiException;
import com.rookies5.intreview.exception.ErrorCode;
import com.rookies5.intreview.repository.QuestionBankQuestionRepository;
import com.rookies5.intreview.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QuestionBankQuestionService {

    private final QuestionBankQuestionRepository questionBankQuestionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<QuestionBankQuestionSummaryResponse> list(long userId, Pageable pageable) {
        ensureUserExists(userId);
        Page<QuestionBankQuestion> page = questionBankQuestionRepository.findByOwner_Id(userId, pageable);
        return PageResponse.of(page.map(QuestionBankQuestionSummaryResponse::from));
    }

    @Transactional(readOnly = true)
    public QuestionBankQuestionDetailResponse get(long userId, long questionId) {
        ensureUserExists(userId);
        QuestionBankQuestion entity = getOwnedOrThrow(userId, questionId);
        return QuestionBankQuestionDetailResponse.from(entity);
    }

    @Transactional
    public QuestionBankQuestionDetailResponse create(long userId, CreateQuestionBankQuestionRequest request) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        QuestionBankQuestion entity = QuestionBankQuestion.create(
                owner,
                request.questionText().trim(),
                request.sourceType()
        );
        questionBankQuestionRepository.save(entity);
        return QuestionBankQuestionDetailResponse.from(entity);
    }

    @Transactional
    public QuestionBankQuestionDetailResponse patch(long userId, long questionId, PatchQuestionBankQuestionRequest request) {
        QuestionBankQuestion entity = getOwnedOrThrow(userId, questionId);

        if (request.archived() != null) {
            entity.setArchived(request.archived());
        }
        if (request.questionText() != null) {
            String text = request.questionText().trim();
            if (text.isEmpty()) {
                throw new IllegalArgumentException("questionText는 비어 있을 수 없습니다.");
            }
            entity.updateQuestionText(text);
        }

        return QuestionBankQuestionDetailResponse.from(entity);
    }

    @Transactional
    public void delete(long userId, long questionId) {
        QuestionBankQuestion entity = getOwnedOrThrow(userId, questionId);
        questionBankQuestionRepository.delete(entity);
    }

    private void ensureUserExists(long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ApiException(ErrorCode.USER_NOT_FOUND);
        }
    }

    private QuestionBankQuestion getOwnedOrThrow(long userId, long questionId) {
        return questionBankQuestionRepository.findByIdAndOwner_Id(questionId, userId)
                .orElseGet(() -> {
                    if (questionBankQuestionRepository.existsById(questionId)) {
                        throw new ApiException(ErrorCode.ACCESS_DENIED);
                    }
                    throw new ApiException(ErrorCode.QUESTION_BANK_NOT_FOUND);
                });
    }
}
