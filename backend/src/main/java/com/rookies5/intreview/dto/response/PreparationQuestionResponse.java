package com.rookies5.intreview.dto.response;

import com.rookies5.intreview.domain.preparation.PreparationQuestion;
import com.rookies5.intreview.domain.preparation.PreparationQuestionSourceType;

import java.time.Instant;

public final class PreparationQuestionResponse {

    private final Long id;
    private final Long questionBankQuestionId;
    private final PreparationQuestionSourceType sourceType;
    private final String questionTextSnapshot;
    private final String practiceAnswer;
    private final Instant createdAt;
    private final Instant updatedAt;

    public PreparationQuestionResponse(
            Long id,
            Long questionBankQuestionId,
            PreparationQuestionSourceType sourceType,
            String questionTextSnapshot,
            String practiceAnswer,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.questionBankQuestionId = questionBankQuestionId;
        this.sourceType = sourceType;
        this.questionTextSnapshot = questionTextSnapshot;
        this.practiceAnswer = practiceAnswer;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getQuestionBankQuestionId() {
        return questionBankQuestionId;
    }

    public PreparationQuestionSourceType getSourceType() {
        return sourceType;
    }

    public String getQuestionTextSnapshot() {
        return questionTextSnapshot;
    }

    public String getPracticeAnswer() {
        return practiceAnswer;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public static PreparationQuestionResponse from(PreparationQuestion entity) {
        Long questionBankQuestionId = entity.getQuestionBankQuestion() != null
                ? entity.getQuestionBankQuestion().getId()
                : null;
        return new PreparationQuestionResponse(
                entity.getId(),
                questionBankQuestionId,
                entity.getSourceType(),
                entity.getQuestionTextSnapshot(),
                entity.getPracticeAnswer(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
