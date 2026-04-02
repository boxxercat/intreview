package com.rookies5.intreview.dto.request;

import jakarta.validation.constraints.Size;

public record PatchQuestionBankQuestionRequest(
        @Size(max = 4000, message = "questionText는 4000자 이하여야 합니다.")
        String questionText,

        Boolean archived
) {}
