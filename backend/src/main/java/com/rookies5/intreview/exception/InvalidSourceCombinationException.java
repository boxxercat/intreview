package com.rookies5.intreview.exception;

public class InvalidSourceCombinationException extends RuntimeException {

    public InvalidSourceCombinationException() {
        super("sourceType과 참조 필드 조합이 올바르지 않습니다.");
    }
}
