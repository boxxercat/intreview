package com.rookies5.intreview.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "username은 필수입니다.")
        @Size(min = 3, max = 30, message = "username은 3~30자여야 합니다.")
        @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "username은 영문, 숫자, 언더스코어만 허용됩니다.")
        String username,

        @NotBlank(message = "password는 필수입니다.")
        @Size(min = 8, max = 100, message = "password는 8~100자여야 합니다.")
        String password
) {}
