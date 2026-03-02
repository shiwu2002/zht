package com.mzdx.zht.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mzdx.zht.entity.Favorite;
import com.mzdx.zht.entity.Item;
import com.mzdx.zht.mapper.FavoriteMapper;
import com.mzdx.zht.service.FavoriteService;
import com.mzdx.zht.service.ItemService;
import com.mzdx.zht.vo.ItemVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 收藏服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl extends ServiceImpl<FavoriteMapper, Favorite> implements FavoriteService {
    
    private final ItemService itemService;
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean addFavorite(Long itemId, Long userId) {
        // 检查是否已收藏
        if (isFavorite(itemId, userId)) {
            return true;
        }
        
        Favorite favorite = new Favorite();
        favorite.setItemId(itemId);
        favorite.setUserId(userId);
        
        boolean result = this.save(favorite);
        
        // 更新物品收藏数
        if (result) {
            Item item = itemService.getById(itemId);
            if (item != null) {
                item.setFavoriteCount(item.getFavoriteCount() + 1);
                itemService.updateById(item);
            }
        }
        
        return result;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean removeFavorite(Long itemId, Long userId) {
        boolean result = this.remove(new LambdaQueryWrapper<Favorite>()
                .eq(Favorite::getItemId, itemId)
                .eq(Favorite::getUserId, userId));
        
        // 更新物品收藏数
        if (result) {
            Item item = itemService.getById(itemId);
            if (item != null && item.getFavoriteCount() > 0) {
                item.setFavoriteCount(item.getFavoriteCount() - 1);
                itemService.updateById(item);
            }
        }
        
        return result;
    }
    
    @Override
    public boolean isFavorite(Long itemId, Long userId) {
        return this.count(new LambdaQueryWrapper<Favorite>()
                .eq(Favorite::getItemId, itemId)
                .eq(Favorite::getUserId, userId)) > 0;
    }
    
    @Override
    public Page<ItemVO> getMyFavorites(Long userId, Integer current, Integer size) {
        Page<Favorite> page = new Page<>(current, size);
        Page<Favorite> favoritePage = this.page(page, new LambdaQueryWrapper<Favorite>()
                .eq(Favorite::getUserId, userId)
                .orderByDesc(Favorite::getCreateTime));
        
        List<Long> itemIds = favoritePage.getRecords().stream()
                .map(Favorite::getItemId)
                .collect(Collectors.toList());
        
        if (itemIds.isEmpty()) {
            return new Page<>(current, size, 0);
        }
        
        List<Item> items = itemService.listByIds(itemIds);
        Page<ItemVO> voPage = new Page<>(favoritePage.getCurrent(), favoritePage.getSize(), favoritePage.getTotal());
        voPage.setRecords(items.stream()
                .map(item -> BeanUtil.copyProperties(item, ItemVO.class))
                .collect(Collectors.toList()));
        
        return voPage;
    }
}
