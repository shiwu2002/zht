package com.mzdx.zht.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mzdx.zht.common.Result;
import com.mzdx.zht.entity.Report;
import com.mzdx.zht.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 举报控制器
 */
@Tag(name = "举报管理")
@RestController
@RequestMapping("/report")
@RequiredArgsConstructor
public class ReportController {
    
    private final ReportService reportService;
    
    @Operation(summary = "提交举报")
    @PostMapping("/submit")
    public Result<Boolean> submitReport(@RequestAttribute("userId") Long userId,
                                        @RequestBody Report report) {
        boolean result = reportService.submitReport(report, userId);
        return Result.success(result);
    }
    
    @Operation(summary = "获取举报列表（管理员）")
    @GetMapping("/list")
    public Result<Page<Report>> getReportList(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer status) {
        Page<Report> page = reportService.getReportList(current, size, status);
        return Result.success(page);
    }
    
    @Operation(summary = "处理举报（管理员）")
    @PostMapping("/handle/{reportId}")
    public Result<Boolean> handleReport(@PathVariable Long reportId,
                                        @RequestParam Integer status,
                                        @RequestParam String handleResult) {
        boolean result = reportService.handleReport(reportId, status, handleResult);
        return Result.success(result);
    }
}
