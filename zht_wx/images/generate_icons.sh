#!/bin/bash
# 使用 ImageMagick 生成简单图标

# 检查是否安装 ImageMagick
if ! command -v convert &> /dev/null; then
    echo "请安装 ImageMagick: brew install imagemagick"
    exit 1
fi

# 生成首页图标 (房子)
convert -size 164x164 xc:transparent -fill "#999999" \
  -draw "polygon 82,20 144,82 144,144 124,144 124,102 40,102 40,144 20,144 20,82" \
  home.png

convert -size 164x164 xc:transparent -fill "#07c160" \
  -draw "polygon 82,20 144,82 144,144 124,144 124,102 40,102 40,144 20,144 20,82" \
  home_active.png

# 生成分类图标 (网格)
convert -size 164x164 xc:transparent -fill "#999999" \
  -draw "rectangle 20,20 70,70" -draw "rectangle 94,20 144,70" \
  -draw "rectangle 20,94 70,144" -draw "rectangle 94,94 144,144" \
  category.png

convert -size 164x164 xc:transparent -fill "#07c160" \
  -draw "rectangle 20,20 70,70" -draw "rectangle 94,20 144,70" \
  -draw "rectangle 20,94 70,144" -draw "rectangle 94,94 144,144" \
  category_active.png

# 生成消息图标 (对话气泡)
convert -size 164x164 xc:transparent -fill "#999999" \
  -draw "roundrectangle 20,40 144,120 20,20" \
  -draw "polygon 60,120 80,140 100,120" \
  message.png

convert -size 164x164 xc:transparent -fill "#07c160" \
  -draw "roundrectangle 20,40 144,120 20,20" \
  -draw "polygon 60,120 80,140 100,120" \
  message_active.png

# 生成用户图标 (人形)
convert -size 164x164 xc:transparent -fill "#999999" \
  -draw "circle 82,50 62,50" \
  -draw "arc 42,70 122,140 0,180" \
  user.png

convert -size 164x164 xc:transparent -fill "#07c160" \
  -draw "circle 82,50 62,50" \
  -draw "arc 42,70 122,140 0,180" \
  user_active.png

echo "图标生成完成!"
