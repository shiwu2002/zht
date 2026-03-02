package com.mzdx.zht.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mzdx.zht.common.ResultCode;
import com.mzdx.zht.dto.ItemDTO;
import com.mzdx.zht.entity.Item;
import com.mzdx.zht.exception.BusinessException;
import com.mzdx.zht.mapper.ItemMapper;
import com.mzdx.zht.service.ItemService;
import com.mzdx.zht.vo.ItemVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 物品服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ItemServiceImpl extends ServiceImpl<ItemMapper, Item> implements ItemService {
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean publishItem(ItemDTO itemDTO, Long userId) {
        Item item = BeanUtil.copyProperties(itemDTO, Item.class);
        item.setUserId(userId);
        item.setStatus(1); // 上架状态
        item.setViewCount(0);
        item.setFavoriteCount(0);
        return this.save(item);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateItem(ItemDTO itemDTO, Long userId) {
        Item item = this.getById(itemDTO.getId());
        if (item == null) {
            throw new BusinessException(ResultCode.ITEM_NOT_FOUND);
        }
        if (!item.getUserId().equals(userId)) {
            throw new BusinessException(ResultCode.ITEM_NO_PERMISSION);
        }
        BeanUtil.copyProperties(itemDTO, item, "id", "userId", "viewCount", "favoriteCount");
        return this.updateById(item);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteItem(Long itemId, Long userId) {
        Item item = this.getById(itemId);
        if (item == null) {
            throw new BusinessException(ResultCode.ITEM_NOT_FOUND);
        }
        if (!item.getUserId().equals(userId)) {
            throw new BusinessException(ResultCode.ITEM_NO_PERMISSION);
        }
        return this.removeById(itemId);
    }
    
    @Override
    public ItemVO getItemDetail(Long itemId) {
        Item item = this.getById(itemId);
        if (item == null) {
            throw new BusinessException(ResultCode.ITEM_NOT_FOUND);
        }
        // 增加浏览次数
        item.setViewCount(item.getViewCount() + 1);
        this.updateById(item);
        
        return BeanUtil.copyProperties(item, ItemVO.class);
    }
    
    @Override
    public Page<ItemVO> getItemList(Integer current, Integer size, Long categoryId,
                                     String keyword, Integer type, String sortBy) {
        Page<Item> page = new Page<>(current, size);
        LambdaQueryWrapper<Item> wrapper = new LambdaQueryWrapper<>();
        
        // 只查询上架的物品
        wrapper.eq(Item::getStatus, 1);
        
        if (categoryId != null) {
            wrapper.eq(Item::getCategoryId, categoryId);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Item::getTitle, keyword)
                   .or()
                   .like(Item::getDescription, keyword);
        }
        if (type != null) {
            wrapper.eq(Item::getExchangeType, type);
        }
        
        // 排序
        if ("view".equals(sortBy)) {
            wrapper.orderByDesc(Item::getViewCount);
        } else if ("favorite".equals(sortBy)) {
            wrapper.orderByDesc(Item::getFavoriteCount);
        } else {
            wrapper.orderByDesc(Item::getCreateTime);
        }
        
        Page<Item> itemPage = this.page(page, wrapper);
        Page<ItemVO> voPage = new Page<>(itemPage.getCurrent(), itemPage.getSize(), itemPage.getTotal());
        voPage.setRecords(itemPage.getRecords().stream()
                .map(item -> BeanUtil.copyProperties(item, ItemVO.class))
                .collect(Collectors.toList()));
        return voPage;
    }
    
    @Override
    public Page<ItemVO> getMyItems(Long userId, Integer current, Integer size) {
        Page<Item> page = new Page<>(current, size);
        LambdaQueryWrapper<Item> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Item::getUserId, userId)
               .orderByDesc(Item::getCreateTime);
        
        Page<Item> itemPage = this.page(page, wrapper);
        Page<ItemVO> voPage = new Page<>(itemPage.getCurrent(), itemPage.getSize(), itemPage.getTotal());
        voPage.setRecords(itemPage.getRecords().stream()
                .map(item -> BeanUtil.copyProperties(item, ItemVO.class))
                .collect(Collectors.toList()));
        return voPage;
    }
    
    @Override
    public List<ItemVO> getNearbyItems(Double longitude, Double latitude, Integer distance) {
        // 简化实现：查询所有上架物品，实际应使用地理位置计算
        List<Item> items = this.list(new LambdaQueryWrapper<Item>()
                .eq(Item::getStatus, 1)
                .orderByDesc(Item::getCreateTime)
                .last("LIMIT 20"));
        
        return items.stream()
                .map(item -> BeanUtil.copyProperties(item, ItemVO.class))
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateItemStatus(Long itemId, Integer status) {
        Item item = this.getById(itemId);
        if (item == null) {
            throw new BusinessException(ResultCode.ITEM_NOT_FOUND);
        }
        item.setStatus(status);
        return this.updateById(item);
    }
}
