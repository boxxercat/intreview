package com.rookies5.intreview.repository;

import com.rookies5.intreview.domain.interview.InterviewQuestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {

    List<InterviewQuestion> findByPreparationQuestion_Id(Long preparationQuestionId);

    Page<InterviewQuestion> findByInterview_IdOrderBySortOrderAscIdAsc(Long interviewId, Pageable pageable);

    @EntityGraph(attributePaths = {"preparationQuestion", "questionBankQuestion"})
    Optional<InterviewQuestion> findByIdAndInterview_Id(Long id, Long interviewId);
}
