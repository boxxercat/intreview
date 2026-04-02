package com.rookies5.intreview.dto.request;

import jakarta.validation.constraints.Size;

public record PatchPreparationQuestionRequest(
        @Size(max = 4000, message = "questionTextSnapshot은 4000자 이하여야 합니다.")
        String questionTextSnapshot,

        @Size(max = 8000, message = "practiceAnswer는 8000자 이하여야 합니다.")
        String practiceAnswer
) {}
