package com.rookies5.intreview.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateInterviewRequest(
        @NotBlank(message = "companyName은 필수입니다.")
        @Size(max = 120, message = "companyName은 120자 이하여야 합니다.")
        String companyName,

        @NotBlank(message = "positionTitle은 필수입니다.")
        @Size(max = 120, message = "positionTitle은 120자 이하여야 합니다.")
        String positionTitle,

        @NotNull(message = "interviewDate는 필수입니다.")
        LocalDate interviewDate,

        @Size(max = 2000, message = "interviewRound는 2000자 이하여야 합니다.")
        String interviewRound
) {}
