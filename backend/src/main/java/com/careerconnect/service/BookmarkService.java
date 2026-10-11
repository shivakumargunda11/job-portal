package com.careerconnect.service;

import com.careerconnect.entity.Bookmark;
import com.careerconnect.entity.Opportunity;
import com.careerconnect.entity.User;
import com.careerconnect.repository.BookmarkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final OpportunityService opportunityService;

    public BookmarkService(BookmarkRepository bookmarkRepository, OpportunityService opportunityService) {
        this.bookmarkRepository = bookmarkRepository;
        this.opportunityService = opportunityService;
    }

    public Bookmark addBookmark(User student, Long opportunityId) {
        Opportunity opportunity = opportunityService.findById(opportunityId);
        if (bookmarkRepository.existsByStudentAndOpportunity(student, opportunity)) {
            throw new IllegalStateException("Already bookmarked");
        }
        Bookmark bookmark = new Bookmark();
        bookmark.setStudent(student);
        bookmark.setOpportunity(opportunity);
        return bookmarkRepository.save(bookmark);
    }

    @Transactional
    public void removeBookmark(User student, Long opportunityId) {
        Opportunity opportunity = opportunityService.findById(opportunityId);
        bookmarkRepository.deleteByStudentAndOpportunity(student, opportunity);
    }

    public List<Bookmark> getBookmarks(User student) {
        return bookmarkRepository.findByStudent(student);
    }

    public boolean isBookmarked(User student, Long opportunityId) {
        Opportunity opportunity = opportunityService.findById(opportunityId);
        return bookmarkRepository.existsByStudentAndOpportunity(student, opportunity);
    }

    @Transactional
    public void removeBookmarkById(User student, Long bookmarkId) {
        bookmarkRepository.deleteById(bookmarkId);
    }
}
