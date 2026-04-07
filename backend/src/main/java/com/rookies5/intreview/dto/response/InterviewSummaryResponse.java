package com.rookies5.intreview.dto.response;

import com.rookies5.intreview.domain.interview.Interview;

import java.time.Instant;
import java.time.LocalDate;

public final class InterviewSummaryResponse {

    private final Long id;
    private final String companyName;
    private final String positionTitle;
    private final LocalDate interviewDate;
    private final String interviewRound;
    private final Instant createdAt;

    public InterviewSummaryResponse(
            Long id,
            String companyName,
            String positionTitle,
            LocalDate interviewDate,
            String interviewRound,
            Instant createdAt
    ) {
        this.id = id;
        this.companyName = companyName;
        this.positionTitle = positionTitle;
        this.interviewDate = interviewDate;
        this.interviewRound = interviewRound;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getPositionTitle() {
        return positionTitle;
    }

    public LocalDate getInterviewDate() {
        return interviewDate;
    }

    public String getInterviewRound() {
        return interviewRound;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public static InterviewSummaryResponse from(Interview entity) {
        return new InterviewSummaryResponse(
                entity.getId(),
                entity.getCompanyName(),
                entity.getPositionTitle(),
                entity.getInterviewDate(),
                entity.getInterviewRound(),
                entity.getCreatedAt()
        );
    }
}
