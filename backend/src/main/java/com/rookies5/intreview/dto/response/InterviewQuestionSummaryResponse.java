package com.rookies5.intreview.dto.response;

import com.rookies5.intreview.domain.interview.InterviewQuestion;
import com.rookies5.intreview.domain.interview.InterviewQuestionSourceType;

import java.time.Instant;

public final class InterviewQuestionSummaryResponse {

    private final Long id;
    private final InterviewQuestionSourceType sourceType;
    private final String questionTextSnapshot;
    private final int sortOrder;
    private final Instant createdAt;

    public InterviewQuestionSummaryResponse(
            Long id,
            InterviewQuestionSourceType sourceType,
            String questionTextSnapshot,
            int sortOrder,
            Instant createdAt
    ) {
        this.id = id;
        this.sourceType = sourceType;
        this.questionTextSnapshot = questionTextSnapshot;
        this.sortOrder = sortOrder;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public static InterviewQuestionSummaryResponse from(InterviewQuestion entity) {
        return new InterviewQuestionSummaryResponse(
                entity.getId(),
                entity.getSourceType(),
                entity.getQuestionTextSnapshot(),
                entity.getSortOrder(),
                entity.getCreatedAt()
        );
    }
}
