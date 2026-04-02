package com.rookies5.intreview.dto.response;

import com.rookies5.intreview.domain.interview.InterviewQuestion;
import com.rookies5.intreview.domain.interview.InterviewQuestionSourceType;

import java.time.Instant;

public final class InterviewQuestionDetailResponse {

    private final Long id;
    private final Long preparationQuestionId;
    private final Long questionBankQuestionId;
    private final InterviewQuestionSourceType sourceType;
    private final String questionTextSnapshot;
    private final int sortOrder;
    private final String answerText;
    private final String reviewText;
    private final Instant createdAt;
    private final Instant updatedAt;

    public InterviewQuestionDetailResponse(
            Long id,
            Long preparationQuestionId,
            Long questionBankQuestionId,
            InterviewQuestionSourceType sourceType,
            String questionTextSnapshot,
            int sortOrder,
            String answerText,
            String reviewText,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.preparationQuestionId = preparationQuestionId;
        this.questionBankQuestionId = questionBankQuestionId;
        this.sourceType = sourceType;
        this.questionTextSnapshot = questionTextSnapshot;
        this.sortOrder = sortOrder;
        this.answerText = answerText;
        this.reviewText = reviewText;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getPreparationQuestionId() {
        return preparationQuestionId;
    }

    public Long getQuestionBankQuestionId() {
        return questionBankQuestionId;
    }

    public InterviewQuestionSourceType getSourceType() {
        return sourceType;
    }

    public String getQuestionTextSnapshot() {
        return questionTextSnapshot;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public String getAnswerText() {
        return answerText;
    }

    public String getReviewText() {
        return reviewText;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public static InterviewQuestionDetailResponse from(InterviewQuestion entity) {
        Long preparationQuestionId = entity.getPreparationQuestion() != null
                ? entity.getPreparationQuestion().getId()
                : null;
        Long questionBankQuestionId = entity.getQuestionBankQuestion() != null
                ? entity.getQuestionBankQuestion().getId()
                : null;

        return new InterviewQuestionDetailResponse(
                entity.getId(),
                preparationQuestionId,
                questionBankQuestionId,
                entity.getSourceType(),
                entity.getQuestionTextSnapshot(),
                entity.getSortOrder(),
                entity.getAnswerText(),
                entity.getReviewText(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
