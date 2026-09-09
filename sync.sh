#!/usr/bin/env bash
# 把"任意本地 HTML 项目文件夹"同步进 text 仓库，自动上线到 GitHub Pages。
#
# 用法：
#   ./sync.sh <本地HTML文件夹绝对路径>           # 子目录名默认取文件夹名
#   ./sync.sh <本地HTML文件夹绝对路径> 子目录名   # 自定义在 text 仓库里的子目录名
#
# 例：
#   ./sync.sh /Users/liuzhaoming/WorkBuddy/其他/我的活动页
#   ./sync.sh /Users/liuzhaoming/WorkBuddy/其他/我的活动页 event-2026
#
# 效果：该文件夹会被整体复制进 text/<子目录名>/，提交并推送，
#       之后即可访问 https://liuzhaomin.github.io/text/<子目录名>/
set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC="${1:-}"

if [ -z "$SRC" ]; then
  echo "用法: ./sync.sh <本地HTML文件夹路径> [在text仓库中的子目录名]"
  exit 1
fi
[ -d "$SRC" ] || { echo "源文件夹不存在: $SRC"; exit 1; }

NAME="${2:-$(basename "$SRC")}"
DEST="$REPO_DIR/$NAME"

cd "$REPO_DIR"

echo "== 复制 $SRC -> $DEST =="
rm -rf "$DEST"
mkdir -p "$DEST"
cp -R "$SRC/." "$DEST/"
# 清掉源项目里可能自带的 .git，避免嵌套仓库导致 git 异常
find "$DEST" -name .git -not -path "$REPO_DIR/.git" -exec rm -rf {} + 2>/dev/null || true

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

git add -A
if git diff --cached --quiet; then
  echo "没有需要提交的改动。"
else
  git -c user.name="liuzhaomin" -c user.email="liuzhaomin@users.noreply.github.com" commit -m "Sync $NAME from local"
  echo "已提交: Sync $NAME"
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
  echo "  https://liuzhaomin.github.io/text/$NAME/"
else
  echo "推送未成功（多半是网络代理问题）。请在你的 Mac 终端直接重试："
  echo "  cd $REPO_DIR && git push"
fi
