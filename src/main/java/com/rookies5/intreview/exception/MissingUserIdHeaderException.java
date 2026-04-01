package com.rookies5.intreview.exception;

public class MissingUserIdHeaderException extends RuntimeException {

    public MissingUserIdHeaderException() {
        super("X-User-Id 헤더가 필요합니다.");
    }
}
