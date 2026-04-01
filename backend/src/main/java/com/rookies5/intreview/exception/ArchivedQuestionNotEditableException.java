package com.rookies5.intreview.exception;

public class ArchivedQuestionNotEditableException extends RuntimeException {

    public ArchivedQuestionNotEditableException() {
        super("보관된 질문 자산은 수정할 수 없습니다. archived를 해제하거나 새 자산을 등록하세요.");
    }
}
