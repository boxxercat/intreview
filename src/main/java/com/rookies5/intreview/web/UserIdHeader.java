package com.rookies5.intreview.web;

import com.rookies5.intreview.exception.InvalidUserIdHeaderException;
import com.rookies5.intreview.exception.MissingUserIdHeaderException;

public final class UserIdHeader {

    private UserIdHeader() {}

    public static long parseRequired(String header) {
        if (header == null || header.isBlank()) {
            throw new MissingUserIdHeaderException();
        }
        try {
            return Long.parseLong(header.trim());
        } catch (NumberFormatException e) {
            throw new InvalidUserIdHeaderException();
        }
    }
}
