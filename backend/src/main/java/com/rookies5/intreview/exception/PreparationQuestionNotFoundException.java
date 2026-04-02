package com.rookies5.intreview.exception;

public class PreparationQuestionNotFoundException extends RuntimeException {

    public PreparationQuestionNotFoundException() {
        super("준비 질문을 찾을 수 없습니다.");
    }
}
