package com.rookies5.intreview.web;

import com.rookies5.intreview.exception.ApiException;
import com.rookies5.intreview.exception.ErrorCode;

public final class UserIdHeader {

    private UserIdHeader() {}

    public static long parseRequired(String header) {
        if (header == null || header.isBlank()) {
            throw new ApiException(ErrorCode.USER_ID_REQUIRED);
        }
        try {
            return Long.parseLong(header.trim());
        } catch (NumberFormatException e) {
            throw new ApiException(ErrorCode.INVALID_USER_ID_HEADER);
        }
    }
}
