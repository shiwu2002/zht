package com.mzdx.zht.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mzdx.zht.common.ResultCode;
import com.mzdx.zht.dto.ItemDTO;
import com.mzdx.zht.entity.Category;
import com.mzdx.zht.entity.Item;
import com.mzdx.zht.entity.User;
import com.mzdx.zht.exception.BusinessException;
import com.mzdx.zht.mapper.ItemMapper;
import com.mzdx.zht.service.CategoryService;
import com.mzdx.zht.service.ItemService;
import com.mzdx.zht.service.UserService;
import com.mzdx.zht.vo.ItemVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemServiceImpl extends ServiceImpl<ItemMapper, Item> implements ItemService {
    
    private final UserService userService;
    private final CategoryService categoryService;
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean publishItem(ItemDTO itemDTO, Long userId) {
        Item item = BeanUtil.copyProperties(itemDTO, Item.class);
        item.setUserId(userId);
        item.setStatus(1);
        item.setViewCount(0);
        item.setFavoriteCount(0);
        
        if (itemDTO.getTags() != null && !itemDTO.getTags().isEmpty()) {
            item.setTags(JSONUtil.toJsonStr(itemDTO.getTags()));
        }
        
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
        
        if (itemDTO.getTags() != null) {
            item.setTags(JSONUtil.toJsonStr(itemDTO.getTags()));
        }
        
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
        
        item.setViewCount(item.getViewCount() + 1);
        this.updateById(item);
        
        return buildItemVO(item);
    }
    
    @Override
    public Page<ItemVO> getItemList(Integer current, Integer size, Long categoryId,
                                     String keyword, Integer type, String sortBy) {
        Page<Item> page = new Page<>(current, size);
        LambdaQueryWrapper<Item> wrapper = new LambdaQueryWrapper<>();
        
        wrapper.eq(Item::getStatus, 1);
        
        if (categoryId != null) {
            wrapper.eq(Item::getCategoryId, categoryId);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Item::getTitle, keyword)
                   .or()
                   .like(Item::getDescription, keyword));
        }
        if (type != null) {
            wrapper.eq(Item::getExchangeType, type);
        }
        
        if ("view".equals(sortBy)) {
            wrapper.orderByDesc(Item::getViewCount);
        } else if ("favorite".equals(sortBy)) {
            wrapper.orderByDesc(Item::getFavoriteCount);
        } else {
            wrapper.orderByDesc(Item::getCreateTime);
        }
        
        Page<Item> itemPage = this.page(page, wrapper);
        return buildItemVOPage(itemPage);
    }
    
    @Override
    public Page<ItemVO> getMyItems(Long userId, Integer current, Integer size) {
        Page<Item> page = new Page<>(current, size);
        LambdaQueryWrapper<Item> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Item::getUserId, userId)
               .orderByDesc(Item::getCreateTime);
        
        Page<Item> itemPage = this.page(page, wrapper);
        return buildItemVOPage(itemPage);
    }
    
    @Override
    public List<ItemVO> getNearbyItems(Double longitude, Double latitude, Integer distance) {
        List<Item> items = this.list(new LambdaQueryWrapper<Item>()
                .eq(Item::getStatus, 1)
                .orderByDesc(Item::getCreateTime)
                .last("LIMIT 20"));
        
        return items.stream()
                .map(this::buildItemVO)
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
    
    private ItemVO buildItemVO(Item item) {
        ItemVO vo = BeanUtil.copyProperties(item, ItemVO.class);
        
        if (item.getUserId() != null) {
            User user = userService.getById(item.getUserId());
            if (user != null) {
                vo.setUserNickname(user.getNickname());
                vo.setUserAvatar(user.getAvatar());
            }
        }
        
        if (item.getCategoryId() != null) {
            Category category = categoryService.getById(item.getCategoryId());
            if (category != null) {
                vo.setCategoryName(category.getName());
            }
        }
        
        if (item.getTags() != null && !item.getTags().isEmpty()) {
            try {
                vo.setTags(JSONUtil.parseArray(item.getTags()).toList(String.class));
            } catch (Exception e) {
                vo.setTags(new ArrayList<>());
            }
        }
        
        return vo;
    }
    
    private Page<ItemVO> buildItemVOPage(Page<Item> itemPage) {
        Page<ItemVO> voPage = new Page<>(itemPage.getCurrent(), itemPage.getSize(), itemPage.getTotal());
        
        List<Item> items = itemPage.getRecords();
        if (items.isEmpty()) {
            voPage.setRecords(new ArrayList<>());
            return voPage;
        }
        
        Set<Long> userIds = items.stream().map(Item::getUserId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> categoryIds = items.stream().map(Item::getCategoryId).filter(Objects::nonNull).collect(Collectors.toSet());
        
        final Map<Long, User> userMap;
        if (!userIds.isEmpty()) {
            List<User> users = userService.listByIds(userIds);
            userMap = users.stream().collect(Collectors.toMap(User::getId, u -> u));
        } else {
            userMap = new HashMap<>();
        }
        
        final Map<Long, Category> categoryMap;
        if (!categoryIds.isEmpty()) {
            List<Category> categories = categoryService.listByIds(categoryIds);
            categoryMap = categories.stream().collect(Collectors.toMap(Category::getId, c -> c));
        } else {
            categoryMap = new HashMap<>();
        }
        
        List<ItemVO> voList = items.stream().map(item -> {
            ItemVO vo = BeanUtil.copyProperties(item, ItemVO.class);
            
            User user = userMap.get(item.getUserId());
            if (user != null) {
                vo.setUserNickname(user.getNickname());
                vo.setUserAvatar(user.getAvatar());
            }
            
            Category category = categoryMap.get(item.getCategoryId());
            if (category != null) {
                vo.setCategoryName(category.getName());
            }
            
            if (item.getTags() != null && !item.getTags().isEmpty()) {
                try {
                    vo.setTags(JSONUtil.parseArray(item.getTags()).toList(String.class));
                } catch (Exception e) {
                    vo.setTags(new ArrayList<>());
                }
            }
            
            return vo;
        }).collect(Collectors.toList());
        
        voPage.setRecords(voList);
        return voPage;
    }
}