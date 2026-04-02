package com.rookies5.intreview.service;

import com.rookies5.intreview.domain.interview.Interview;
import com.rookies5.intreview.domain.interview.InterviewQuestion;
import com.rookies5.intreview.domain.interview.InterviewQuestionSourceType;
import com.rookies5.intreview.domain.preparation.PreparationQuestion;
import com.rookies5.intreview.domain.questionbank.QuestionBankQuestion;
import com.rookies5.intreview.dto.request.CreateInterviewQuestionRequest;
import com.rookies5.intreview.dto.request.PatchInterviewQuestionRequest;
import com.rookies5.intreview.dto.response.InterviewQuestionDetailResponse;
import com.rookies5.intreview.dto.response.InterviewQuestionSummaryResponse;
import com.rookies5.intreview.dto.response.PageResponse;
import com.rookies5.intreview.exception.InterviewNotFoundException;
import com.rookies5.intreview.exception.InterviewQuestionNotFoundException;
import com.rookies5.intreview.exception.InvalidSourceCombinationException;
import com.rookies5.intreview.exception.PreparationQuestionNotFoundException;
import com.rookies5.intreview.exception.QuestionBankNotFoundException;
import com.rookies5.intreview.exception.ResourceAccessDeniedException;
import com.rookies5.intreview.exception.UserNotFoundException;
import com.rookies5.intreview.repository.InterviewQuestionRepository;
import com.rookies5.intreview.repository.InterviewRepository;
import com.rookies5.intreview.repository.PreparationQuestionRepository;
import com.rookies5.intreview.repository.QuestionBankQuestionRepository;
import com.rookies5.intreview.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InterviewQuestionService {

    private final InterviewQuestionRepository interviewQuestionRepository;
    private final InterviewRepository interviewRepository;
    private final PreparationQuestionRepository preparationQuestionRepository;
    private final QuestionBankQuestionRepository questionBankQuestionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<InterviewQuestionSummaryResponse> list(long userId, long interviewId, Pageable pageable) {
        ensureUserAndInterview(userId, interviewId);
        Page<InterviewQuestion> page = interviewQuestionRepository.findByInterview_IdOrderBySortOrderAscIdAsc(interviewId, pageable);
        return PageResponse.of(page.map(InterviewQuestionSummaryResponse::from));
    }

    @Transactional(readOnly = true)
    public InterviewQuestionDetailResponse get(long userId, long interviewId, long questionId) {
        ensureUserAndInterview(userId, interviewId);
        return InterviewQuestionDetailResponse.from(getInterviewQuestionOrThrow(interviewId, questionId));
    }

    @Transactional
    public InterviewQuestionDetailResponse create(long userId, long interviewId, CreateInterviewQuestionRequest request) {
        Interview interview = getOwnedInterviewOrThrow(userId, interviewId);
        InterviewQuestion entity = createBySource(userId, interview, request);
        interview.addInterviewQuestion(entity);
        interviewQuestionRepository.save(entity);
        return InterviewQuestionDetailResponse.from(entity);
    }

    @Transactional
    public InterviewQuestionDetailResponse patch(long userId, long interviewId, long questionId, PatchInterviewQuestionRequest request) {
        getOwnedInterviewOrThrow(userId, interviewId);
        InterviewQuestion entity = getInterviewQuestionOrThrow(interviewId, questionId);

        if (request.answerText() != null) {
            applyOptionalLongText(request.answerText(), entity::updateAnswerText, entity::clearAnswerText);
        }
        if (request.reviewText() != null) {
            applyOptionalLongText(request.reviewText(), entity::updateReviewText, entity::clearReviewText);
        }

        return InterviewQuestionDetailResponse.from(entity);
    }

    @Transactional
    public void delete(long userId, long interviewId, long questionId) {
        getOwnedInterviewOrThrow(userId, interviewId);
        InterviewQuestion entity = getInterviewQuestionOrThrow(interviewId, questionId);
        interviewQuestionRepository.delete(entity);
    }

    private void ensureUserAndInterview(long userId, long interviewId) {
        ensureUserExists(userId);
        getOwnedInterviewOrThrow(userId, interviewId);
    }

    private void ensureUserExists(long userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException();
        }
    }

    private Interview getOwnedInterviewOrThrow(long userId, long interviewId) {
        return interviewRepository.findByIdAndUser_Id(interviewId, userId)
                .orElseGet(() -> {
                    if (interviewRepository.existsById(interviewId)) {
                        throw new ResourceAccessDeniedException();
                    }
                    throw new InterviewNotFoundException();
                });
    }

    private InterviewQuestion getInterviewQuestionOrThrow(long interviewId, long questionId) {
        return interviewQuestionRepository.findByIdAndInterview_Id(questionId, interviewId)
                .orElseThrow(InterviewQuestionNotFoundException::new);
    }

    private InterviewQuestion createBySource(long userId, Interview interview, CreateInterviewQuestionRequest request) {
        int sortOrder = request.sortOrder();
        InterviewQuestionSourceType sourceType = request.sourceType();

        return switch (sourceType) {
            case FROM_PREPARATION -> InterviewQuestion.fromPreparation(
                    interview,
                    getOwnedPreparationQuestionOrThrow(userId, request.preparationQuestionId()),
                    sortOrder
            );
            case FROM_BANK -> InterviewQuestion.fromBank(
                    interview,
                    getOwnedQuestionBankOrThrow(userId, request.questionBankQuestionId()),
                    sortOrder
            );
            case CUSTOM -> InterviewQuestion.fromCustom(interview, requireQuestionText(request.questionTextSnapshot()), sortOrder);
        };
    }

    private PreparationQuestion getOwnedPreparationQuestionOrThrow(long userId, Long preparationQuestionId) {
        if (preparationQuestionId == null) {
            throw new InvalidSourceCombinationException();
        }
        return preparationQuestionRepository.findByIdAndOwner_Id(preparationQuestionId, userId)
                .orElseThrow(() -> {
                    if (preparationQuestionRepository.existsById(preparationQuestionId)) {
                        return new ResourceAccessDeniedException();
                    }
                    return new PreparationQuestionNotFoundException();
                });
    }

    private QuestionBankQuestion getOwnedQuestionBankOrThrow(long userId, Long questionBankQuestionId) {
        if (questionBankQuestionId == null) {
            throw new InvalidSourceCombinationException();
        }
        return questionBankQuestionRepository.findByIdAndOwner_Id(questionBankQuestionId, userId)
                .orElseThrow(() -> {
                    if (questionBankQuestionRepository.existsById(questionBankQuestionId)) {
                        return new ResourceAccessDeniedException();
                    }
                    return new QuestionBankNotFoundException();
                });
    }

    private String requireQuestionText(String value) {
        String trimmed = value == null ? null : value.trim();
        if (trimmed == null || trimmed.isEmpty()) {
            throw new InvalidSourceCombinationException();
        }
        return trimmed;
    }

    private void applyOptionalLongText(String value, java.util.function.Consumer<String> updater, Runnable clearer) {
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            clearer.run();
            return;
        }
        updater.accept(trimmed);
    }
}
