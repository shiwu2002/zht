package com.mzdx.zht.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mzdx.zht.entity.Exchange;
import com.mzdx.zht.dto.ExchangeDTO;
import com.mzdx.zht.vo.ExchangeVO;

/**
 * 交换服务接口
 */
public interface ExchangeService extends IService<Exchange> {
    
    /**
     * 发起交换申请
     */
    boolean createExchange(ExchangeDTO exchangeDTO, Long userId);
    
    /**
     * 确认交换
     */
    boolean confirmExchange(Long exchangeId, Long userId);
    
    /**
     * 拒绝交换
     */
    boolean rejectExchange(Long exchangeId, Long userId, String reason);
    
    /**
     * 取消交换
     */
    boolean cancelExchange(Long exchangeId, Long userId);
    
    /**
     * 完成交换
     */
    boolean completeExchange(Long exchangeId, Long userId);
    
    /**
     * 获取交换详情
     */
    ExchangeVO getExchangeDetail(Long exchangeId);
    
    /**
     * 获取我的交换记录
     */
    Page<ExchangeVO> getMyExchanges(Long userId, Integer current, Integer size, Integer type);
}
