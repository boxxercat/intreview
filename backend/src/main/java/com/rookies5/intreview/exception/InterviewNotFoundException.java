package com.rookies5.intreview.exception;

public class InterviewNotFoundException extends RuntimeException {

    public InterviewNotFoundException() {
        super("면접 정보를 찾을 수 없습니다.");
    }
}
