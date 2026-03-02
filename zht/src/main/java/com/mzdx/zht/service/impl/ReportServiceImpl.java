package com.mzdx.zht.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mzdx.zht.entity.Report;
import com.mzdx.zht.mapper.ReportMapper;
import com.mzdx.zht.service.ReportService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 举报服务实现类
 */
@Slf4j
@Service
public class ReportServiceImpl extends ServiceImpl<ReportMapper, Report> implements ReportService {
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean submitReport(Report report, Long reporterId) {
        report.setReporterId(reporterId);
        report.setStatus(0); // 待处理
        return this.save(report);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean handleReport(Long reportId, Integer status, String handleResult) {
        Report report = this.getById(reportId);
        if (report != null) {
            report.setStatus(status);
            report.setHandleResult(handleResult);
            return this.updateById(report);
        }
        return false;
    }
    
    @Override
    public Page<Report> getReportList(Integer current, Integer size, Integer status) {
        Page<Report> page = new Page<>(current, size);
        LambdaQueryWrapper<Report> wrapper = new LambdaQueryWrapper<>();
        
        if (status != null) {
            wrapper.eq(Report::getStatus, status);
        }
        
        wrapper.orderByDesc(Report::getCreateTime);
        return this.page(page, wrapper);
    }
}
