package com.rookies5.intreview.exception;

public class InvalidUserIdHeaderException extends RuntimeException {

    public InvalidUserIdHeaderException() {
        super("X-User-Id는 유효한 숫자여야 합니다.");
    }
}
