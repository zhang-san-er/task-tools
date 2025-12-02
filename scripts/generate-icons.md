# 生成应用图标

由于无法直接生成PNG图标文件，请使用以下方法之一：

## 方法1：使用在线工具

1. 访问 https://realfavicongenerator.net/
2. 上传一个512x512的图标图片
3. 下载生成的图标文件
4. 将 `android-chrome-192x192.png` 重命名为 `icon-192x192.png`
5. 将 `android-chrome-512x512.png` 重命名为 `icon-512x512.png`
6. 放置到 `public/icons/` 目录

## 方法2：使用ImageMagick（如果已安装）

```bash
# 从SVG生成PNG
convert public/icons/icon.svg -resize 192x192 public/icons/icon-192x192.png
convert public/icons/icon.svg -resize 512x512 public/icons/icon-512x512.png
```

## 方法3：使用Python PIL库

```python
from PIL import Image
import cairosvg

# 将SVG转换为PNG
cairosvg.svg2png(url='public/icons/icon.svg', write_to='public/icons/icon-512x512.png', output_width=512, output_height=512)
cairosvg.svg2png(url='public/icons/icon.svg', write_to='public/icons/icon-192x192.png', output_width=192, output_height=192)
```

## 临时方案

如果暂时没有图标，可以：
1. 使用纯色图片（蓝色 #3b82f6）
2. 使用文字图片（显示"习惯"或"✓"）
3. 应用仍可正常运行，只是缺少图标显示

