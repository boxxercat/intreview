package com.rookies5.intreview.exception;

public class ResourceAccessDeniedException extends RuntimeException {

    public ResourceAccessDeniedException() {
        super("해당 리소스에 접근할 권한이 없습니다.");
    }
}
