package com.rookies5.intreview.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ReorderInterviewQuestionsRequest(
        @NotNull(message = "orderedQuestionIds는 필수입니다.")
        @NotEmpty(message = "orderedQuestionIds는 비어 있을 수 없습니다.")
        List<Long> orderedQuestionIds
) {}
