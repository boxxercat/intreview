package com.rookies5.intreview.dto.response;

import com.rookies5.intreview.domain.questionbank.QuestionAssetSourceType;
import com.rookies5.intreview.domain.questionbank.QuestionBankQuestion;

import java.time.Instant;

public final class QuestionBankQuestionDetailResponse {

    private final Long id;
    private final String questionText;
    private final QuestionAssetSourceType sourceType;
    private final boolean archived;
    private final Instant createdAt;
    private final Instant updatedAt;

    public QuestionBankQuestionDetailResponse(
            Long id,
            String questionText,
            QuestionAssetSourceType sourceType,
            boolean archived,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.questionText = questionText;
        this.sourceType = sourceType;
        this.archived = archived;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public QuestionAssetSourceType getSourceType() {
        return sourceType;
    }

    public boolean isArchived() {
        return archived;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public static QuestionBankQuestionDetailResponse from(QuestionBankQuestion entity) {
        return new QuestionBankQuestionDetailResponse(
                entity.getId(),
                entity.getQuestionText(),
                entity.getSourceType(),
                entity.isArchived(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}

