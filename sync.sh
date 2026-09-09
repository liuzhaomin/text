#!/usr/bin/env bash
# 把"任意本地 HTML 文件或文件夹"同步进 text 仓库，自动上线到 GitHub Pages。
#
# 两种模式：
#   A. 单文件（只同步指定的那一个文件，不复制整个文件夹）
#      ./sync.sh <本地html文件路径>                # 放到 text 仓库根
#      ./sync.sh <本地html文件路径> 子目录/         # 放到 text/子目录/ 下（文件名沿用源）
#      ./sync.sh <本地html文件路径> event/报名.html # 放到 text/event/报名.html
#
#   B. 整个目录（整体同步，原有行为）
#      ./sync.sh <本地文件夹路径>                  # 子目录名默认取文件夹名
#      ./sync.sh <本地文件夹路径> 子目录名          # 自定义在 text 仓库里的子目录名
#
# 例：
#   ./sync.sh /Users/liuzhaoming/WorkBuddy/其他/我的活动页/报名.html
#   ./sync.sh /Users/liuzhaoming/WorkBuddy/其他/我的活动页/报名.html event/
#   ./sync.sh /Users/liuzhaoming/WorkBuddy/其他/我的活动页
set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC="${1:-}"

if [ -z "$SRC" ]; then
  echo "用法: ./sync.sh <本地文件或文件夹路径> [在text仓库中的目标路径]"
  exit 1
fi
if [ ! -e "$SRC" ]; then
  echo "源不存在: $SRC"; exit 1
fi

DST_ARG="${2:-}"

if [ -f "$SRC" ]; then
  # ---------- 单文件模式 ----------
  if [ -z "$DST_ARG" ]; then
    DEST="$REPO_DIR/$(basename "$SRC")"
  elif [ "${DST_ARG%/}" != "$DST_ARG" ] || [ -d "$REPO_DIR/$DST_ARG" ]; then
    # 目标以 / 结尾，或已是存在的目录 -> 放到该目录下，文件名沿用源
    DEST="$REPO_DIR/${DST_ARG%/}/$(basename "$SRC")"
  else
    # 目标是完整文件路径
    DEST="$REPO_DIR/$DST_ARG"
  fi
  mkdir -p "$(dirname "$DEST")"
  echo "== 复制文件 $SRC -> $DEST =="
  cp "$SRC" "$DEST"
elif [ -d "$SRC" ]; then
  # ---------- 目录模式（整体同步）----------
  NAME="${DST_ARG:-$(basename "$SRC")}"
  DEST="$REPO_DIR/$NAME"
  echo "== 复制目录 $SRC -> $DEST =="
  rm -rf "$DEST"
  mkdir -p "$DEST"
  cp -R "$SRC/." "$DEST/"
  # 清掉源项目里可能自带的 .git，避免嵌套仓库导致 git 异常
  find "$DEST" -name .git -not -path "$REPO_DIR/.git" -exec rm -rf {} + 2>/dev/null || true
else
  echo "源既不是文件也不是目录: $SRC"; exit 1
fi

cd "$REPO_DIR"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
REL="${DEST#$REPO_DIR/}"

git add -A
if git diff --cached --quiet; then
  echo "没有需要提交的改动。"
else
  git -c user.name="liuzhaomin" -c user.email="liuzhaomin@users.noreply.github.com" commit -m "Sync $REL from local"
  echo "已提交: Sync $REL"
fi

echo "== 推送到 origin/$BRANCH（代理不稳会自动重试）=="
OK=0
for i in $(seq 1 12); do
  echo "attempt $i"
  if git -c http.version=HTTP/1.1 push -u origin "$BRANCH" 2>&1 | tail -2; then
    if git ls-remote --heads origin "$BRANCH" >/dev/null 2>&1; then OK=1; echo "PUSH_OK"; break; fi
  fi
  sleep 4
done

echo ""
if [ "$OK" -eq 1 ]; then
  echo "完成。在线地址："
  echo "  https://liuzhaomin.github.io/text/$REL"
else
  echo "推送未成功（多半是网络代理问题）。请在你的 Mac 终端直接重试："
  echo "  cd $REPO_DIR && git push"
fi
