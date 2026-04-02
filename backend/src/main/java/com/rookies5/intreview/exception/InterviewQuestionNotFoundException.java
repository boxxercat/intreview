package com.rookies5.intreview.exception;

public class InterviewQuestionNotFoundException extends RuntimeException {

    public InterviewQuestionNotFoundException() {
        super("면접 질문을 찾을 수 없습니다.");
    }
}
