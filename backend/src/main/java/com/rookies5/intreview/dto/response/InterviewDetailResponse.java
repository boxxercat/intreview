package com.rookies5.intreview.dto.response;

import com.rookies5.intreview.domain.interview.Interview;
import com.rookies5.intreview.domain.interview.InterviewStatus;

import java.time.Instant;
import java.time.LocalDate;

public final class InterviewDetailResponse {

    private final Long id;
    private final String companyName;
    private final String positionTitle;
    private final LocalDate interviewDate;
    private final InterviewStatus status;
    private final String memo;
    private final Instant createdAt;
    private final Instant updatedAt;

    public InterviewDetailResponse(
            Long id,
            String companyName,
            String positionTitle,
            LocalDate interviewDate,
            InterviewStatus status,
            String memo,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.companyName = companyName;
        this.positionTitle = positionTitle;
        this.interviewDate = interviewDate;
        this.status = status;
        this.memo = memo;
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

    public InterviewStatus getStatus() {
        return status;
    }

    public String getMemo() {
        return memo;
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
                entity.getStatus(),
                entity.getMemo(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
