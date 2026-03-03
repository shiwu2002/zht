package com.mzdx.zht.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mzdx.zht.common.ResultCode;
import com.mzdx.zht.dto.ExchangeDTO;
import com.mzdx.zht.entity.Exchange;
import com.mzdx.zht.entity.Item;
import com.mzdx.zht.entity.User;
import com.mzdx.zht.exception.BusinessException;
import com.mzdx.zht.mapper.ExchangeMapper;
import com.mzdx.zht.service.ExchangeService;
import com.mzdx.zht.service.ItemService;
import com.mzdx.zht.service.UserService;
import com.mzdx.zht.vo.ExchangeVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 交换服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExchangeServiceImpl extends ServiceImpl<ExchangeMapper, Exchange> implements ExchangeService {
    
    private final ItemService itemService;

    private final UserService userService;
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createExchange(ExchangeDTO exchangeDTO, Long userId) {
        // 验证物品是否存在
        Item requestItem = itemService.getById(exchangeDTO.getRequestItemId());
        Item offerItem = itemService.getById(exchangeDTO.getOfferItemId());
        
        if (requestItem == null || offerItem == null) {
            throw new BusinessException(ResultCode.ITEM_NOT_FOUND);
        }
        
        // 验证物品状态
        if (requestItem.getStatus() != 1 || offerItem.getStatus() != 1) {
            throw new BusinessException(ResultCode.EXCHANGE_ITEM_UNAVAILABLE);
        }
        
        // 不能和自己交换
        if (requestItem.getUserId().equals(offerItem.getUserId())) {
            throw new BusinessException(ResultCode.EXCHANGE_SELF_NOT_ALLOWED);
        }
        
        Exchange exchange = new Exchange();
        exchange.setRequestUserId(userId);
        exchange.setOfferUserId(requestItem.getUserId());
        exchange.setRequestItemId(exchangeDTO.getRequestItemId());
        exchange.setOfferItemId(exchangeDTO.getOfferItemId());
        exchange.setMessage(exchangeDTO.getMessage());
        exchange.setStatus(0); // 待确认
        
        return this.save(exchange);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean confirmExchange(Long exchangeId, Long userId) {
        Exchange exchange = this.getById(exchangeId);
        if (exchange == null) {
            throw new BusinessException(ResultCode.EXCHANGE_NOT_FOUND);
        }
        
        // 只有物品拥有者可以确认
        if (!exchange.getOfferUserId().equals(userId)) {
            throw new BusinessException(ResultCode.EXCHANGE_NO_PERMISSION);
        }
        
        if (exchange.getStatus() != 0) {
            throw new BusinessException(ResultCode.EXCHANGE_STATUS_ERROR);
        }
        
        exchange.setStatus(1); // 已确认
        return this.updateById(exchange);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean rejectExchange(Long exchangeId, Long userId, String reason) {
        Exchange exchange = this.getById(exchangeId);
        if (exchange == null) {
            throw new BusinessException(ResultCode.EXCHANGE_NOT_FOUND);
        }
        
        if (!exchange.getOfferUserId().equals(userId)) {
            throw new BusinessException(ResultCode.EXCHANGE_NO_PERMISSION);
        }
        
        if (exchange.getStatus() != 0) {
            throw new BusinessException(ResultCode.EXCHANGE_STATUS_ERROR);
        }
        
        exchange.setStatus(3); // 已拒绝
        exchange.setRejectReason(reason);
        return this.updateById(exchange);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean cancelExchange(Long exchangeId, Long userId) {
        Exchange exchange = this.getById(exchangeId);
        if (exchange == null) {
            throw new BusinessException(ResultCode.EXCHANGE_NOT_FOUND);
        }
        
        if (!exchange.getRequestUserId().equals(userId)) {
            throw new BusinessException(ResultCode.EXCHANGE_NO_PERMISSION);
        }
        
        if (exchange.getStatus() != 0 && exchange.getStatus() != 1) {
            throw new BusinessException(ResultCode.EXCHANGE_STATUS_ERROR);
        }
        
        exchange.setStatus(4); // 已取消
        return this.updateById(exchange);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean completeExchange(Long exchangeId, Long userId) {
        Exchange exchange = this.getById(exchangeId);
        if (exchange == null) {
            throw new BusinessException(ResultCode.EXCHANGE_NOT_FOUND);
        }
        
        if (!exchange.getRequestUserId().equals(userId) && !exchange.getOfferUserId().equals(userId)) {
            throw new BusinessException(ResultCode.EXCHANGE_NO_PERMISSION);
        }
        
        if (exchange.getStatus() != 1) {
            throw new BusinessException(ResultCode.EXCHANGE_STATUS_ERROR);
        }
        
        exchange.setStatus(2); // 已完成
        
        // 更新物品状态为已交换
        itemService.updateItemStatus(exchange.getRequestItemId(), 2);
        itemService.updateItemStatus(exchange.getOfferItemId(), 2);
        
        return this.updateById(exchange);
    }
    
    @Override
    public ExchangeVO getExchangeDetail(Long exchangeId) {
        Exchange exchange = this.getById(exchangeId);
        if (exchange == null) {
            throw new BusinessException(ResultCode.EXCHANGE_NOT_FOUND);
        }
        
        // 复制基本属性
        ExchangeVO vo = BeanUtil.copyProperties(exchange, ExchangeVO.class);
        
        // 填充请求方物品信息
        Item requestItem = itemService.getById(exchange.getRequestItemId());
        if (requestItem != null) {
            vo.setItemId(requestItem.getId());
            vo.setItemTitle(requestItem.getTitle());
            String[] images = requestItem.getImages() != null ? requestItem.getImages().split(",") : new String[0];
            vo.setItemImage(images.length > 0 ? images[0] : null);
        }
        
        // 填充提供方物品信息（被申请交换的物品）
        Item offerItem = itemService.getById(exchange.getOfferItemId());
        if (offerItem != null) {
            vo.setOfferItemId(offerItem.getId());
            vo.setOfferItemTitle(offerItem.getTitle());
            String[] images = offerItem.getImages() != null ? offerItem.getImages().split(",") : new String[0];
            vo.setOfferItemImage(images.length > 0 ? images[0] : null);
        }
        
        // 填充请求方用户信息（申请人）
        User requestUser = userService.getById(exchange.getRequestUserId());
        if (requestUser != null) {
            vo.setApplicantId(requestUser.getId());
            vo.setApplicantNickname(requestUser.getNickname());
            vo.setApplicantAvatar(requestUser.getAvatar());
        }
        
        // 填充提供方用户信息（物品主人）
        User offerUser = userService.getById(exchange.getOfferUserId());
        if (offerUser != null) {
            vo.setOwnerId(offerUser.getId());
            vo.setOwnerNickname(offerUser.getNickname());
            vo.setOwnerAvatar(offerUser.getAvatar());
        }
        
        return vo;
    }
    
    @Override
    public Page<ExchangeVO> getMyExchanges(Long userId, Integer current, Integer size, Integer type) {
        Page<Exchange> page = new Page<>(current, size);
        LambdaQueryWrapper<Exchange> wrapper = new LambdaQueryWrapper<>();
        
        // type: 1-我发起的，2-我收到的，其他 - 全部
        if (type == null || type <= 0 || type > 2) {
            // 显示全部：发起的或收到的
            wrapper.and(w -> w.eq(Exchange::getRequestUserId, userId)
                    .or()
                    .eq(Exchange::getOfferUserId, userId));
        } else if (type == 1) {
            // 我发起的
            wrapper.eq(Exchange::getRequestUserId, userId);
        } else if (type == 2) {
            // 我收到的
            wrapper.eq(Exchange::getOfferUserId, userId);
        }
        
        wrapper.orderByDesc(Exchange::getCreateTime);
        
        Page<Exchange> exchangePage = this.page(page, wrapper);
        Page<ExchangeVO> voPage = new Page<>(exchangePage.getCurrent(), exchangePage.getSize(), exchangePage.getTotal());
        
        // 填充详细的物品和用户信息
        List<ExchangeVO> voList = exchangePage.getRecords().stream()
                .map(exchange -> {
                    ExchangeVO vo = BeanUtil.copyProperties(exchange, ExchangeVO.class);
                    
                    // 获取请求方物品信息
                    Item requestItem = itemService.getById(exchange.getRequestItemId());
                    if (requestItem != null) {
                        vo.setItemId(requestItem.getId());
                        vo.setItemTitle(requestItem.getTitle());
                        String[] images = requestItem.getImages() != null ? requestItem.getImages().split(",") : new String[0];
                        vo.setItemImage(images.length > 0 ? images[0] : null);
                    }
                    
                    // 获取提供方物品信息（被申请交换的物品）
                    Item offerItem = itemService.getById(exchange.getOfferItemId());
                    if (offerItem != null) {
                        vo.setOfferItemId(offerItem.getId());
                        vo.setOfferItemTitle(offerItem.getTitle());
                        String[] images = offerItem.getImages() != null ? offerItem.getImages().split(",") : new String[0];
                        vo.setOfferItemImage(images.length > 0 ? images[0] : null);
                    }
                    
                    // 获取请求方用户信息（申请人）
                    User requestUser = userService.getById(exchange.getRequestUserId());
                    if (requestUser != null) {
                        vo.setApplicantId(requestUser.getId());
                        vo.setApplicantNickname(requestUser.getNickname());
                        vo.setApplicantAvatar(requestUser.getAvatar());
                    }
                    
                    // 获取提供方用户信息（物品主人）
                    User offerUser = userService.getById(exchange.getOfferUserId());
                    if (offerUser != null) {
                        vo.setOwnerId(offerUser.getId());
                        vo.setOwnerNickname(offerUser.getNickname());
                        vo.setOwnerAvatar(offerUser.getAvatar());
                    }
                    
                    return vo;
                })
                .collect(Collectors.toList());
        
        voPage.setRecords(voList);
        return voPage;
    }
}
