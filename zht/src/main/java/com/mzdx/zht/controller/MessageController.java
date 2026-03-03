package com.mzdx.zht.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mzdx.zht.common.Result;
import com.mzdx.zht.dto.MessageDTO;
import com.mzdx.zht.entity.Message;
import com.mzdx.zht.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 消息控制器
 */
@Tag(name = "消息管理")
@RestController
@RequestMapping("/message")
@RequiredArgsConstructor
public class MessageController {
    
    private final MessageService messageService;
    
    @Operation(summary = "发送消息")
    @PostMapping("/send")
    public Result<Boolean> sendMessage(@RequestAttribute("userId") Long userId,
                                       @RequestBody MessageDTO messageDTO) {
        boolean result = messageService.sendMessage(messageDTO, userId);
        return Result.success(result);
    }
    
    @Operation(summary = "获取会话列表")
    @GetMapping("/conversations")
    public Result<List<Message>> getConversationList(@RequestAttribute("userId") Long userId) {
        List<Message> messages = messageService.getConversationList(userId);
        return Result.success(messages);
    }
    
    @Operation(summary = "获取聊天记录")
    @GetMapping("/history")
    public Result<Page<Message>> getChatHistory(
            @RequestAttribute("userId") Long userId,
            @RequestParam Long targetUserId,
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "20") Integer size) {
        Page<Message> page = messageService.getChatHistory(userId, targetUserId, current, size);
        return Result.success(page);
    }
    
    @Operation(summary = "标记消息已读")
    @PostMapping("/read/{messageId}")
    public Result<Boolean> markAsRead(@PathVariable Long messageId) {
        boolean result = messageService.markAsRead(messageId);
        return Result.success(result);
    }
    
    @Operation(summary = "获取未读消息数")
    @GetMapping("/unread-count")
    public Result<Integer> getUnreadCount(@RequestAttribute("userId") Long userId) {
        Integer count = messageService.getUnreadCount(userId);
        return Result.success(count);
    }
}
