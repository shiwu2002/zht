package com.mzdx.zht.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mzdx.zht.entity.Report;

/**
 * 举报服务接口
 */
public interface ReportService extends IService<Report> {
    
    /**
     * 提交举报
     */
    boolean submitReport(Report report, Long reporterId);
    
    /**
     * 处理举报
     */
    boolean handleReport(Long reportId, Integer status, String handleResult);
    
    /**
     * 获取举报列表
     */
    Page<Report> getReportList(Integer current, Integer size, Integer status);
}
