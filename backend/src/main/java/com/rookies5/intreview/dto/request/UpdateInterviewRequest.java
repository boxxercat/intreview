package com.rookies5.intreview.dto.request;

import com.rookies5.intreview.domain.interview.InterviewStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateInterviewRequest(
        @NotBlank(message = "companyName은 필수입니다.")
        @Size(max = 120, message = "companyName은 120자 이하여야 합니다.")
        String companyName,

        @NotBlank(message = "positionTitle은 필수입니다.")
        @Size(max = 120, message = "positionTitle은 120자 이하여야 합니다.")
        String positionTitle,

        @NotNull(message = "interviewDate는 필수입니다.")
        LocalDate interviewDate,

        @NotNull(message = "status는 필수입니다.")
        InterviewStatus status,

        @Size(max = 2000, message = "memo는 2000자 이하여야 합니다.")
        String memo
) {}
