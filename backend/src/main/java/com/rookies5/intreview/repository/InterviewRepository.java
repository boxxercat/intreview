package com.rookies5.intreview.repository;

import com.rookies5.intreview.domain.interview.Interview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    Page<Interview> findByUser_Id(Long userId, Pageable pageable);

    Optional<Interview> findByIdAndUser_Id(Long id, Long userId);

    @EntityGraph(attributePaths = {"interviewQuestions"})
    Optional<Interview> findWithInterviewQuestionsByIdAndUser_Id(Long id, Long userId);
}
