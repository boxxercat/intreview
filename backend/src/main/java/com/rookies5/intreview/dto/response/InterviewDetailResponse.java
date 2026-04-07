package com.rookies5.intreview.dto.response;

import com.rookies5.intreview.domain.interview.Interview;

import java.time.Instant;
import java.time.LocalDate;

public final class InterviewDetailResponse {

    private final Long id;
    private final String companyName;
    private final String positionTitle;
    private final LocalDate interviewDate;
    private final String interviewRound;
    private final Instant createdAt;
    private final Instant updatedAt;

    public InterviewDetailResponse(
            Long id,
            String companyName,
            String positionTitle,
            LocalDate interviewDate,
            String interviewRound,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.companyName = companyName;
        this.positionTitle = positionTitle;
        this.interviewDate = interviewDate;
        this.interviewRound = interviewRound;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public static InterviewDetailResponse from(Interview entity) {
        return new InterviewDetailResponse(
                entity.getId(),
                entity.getCompanyName(),
                entity.getPositionTitle(),
                entity.getInterviewDate(),
                entity.getInterviewRound(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
