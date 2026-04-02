package com.rookies5.intreview.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.rookies5.intreview.domain.questionbank.QuestionAssetSourceType;
import com.rookies5.intreview.domain.questionbank.QuestionBankQuestion;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public final class QuestionBankQuestionSummaryResponse {

    private final Long id;
    private final String questionText;
    private final QuestionAssetSourceType sourceType;
    private final boolean archived;
    private final Instant createdAt;

    public QuestionBankQuestionSummaryResponse(
            Long id,
            String questionText,
            QuestionAssetSourceType sourceType,
            boolean archived,
            Instant createdAt
    ) {
        this.id = id;
        this.questionText = questionText;
        this.sourceType = sourceType;
        this.archived = archived;
        this.createdAt = createdAt;
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

    public static QuestionBankQuestionSummaryResponse from(QuestionBankQuestion entity) {
        return new QuestionBankQuestionSummaryResponse(
                entity.getId(),
                entity.getQuestionText(),
                entity.getSourceType(),
                entity.isArchived(),
                entity.getCreatedAt()
        );
    }
}