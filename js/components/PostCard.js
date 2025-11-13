import { formatDate } from "../utils/DateFormatter.js";
import { formatNumber } from "../utils/NumberFormatter.js";

export const PostCard = (post) => `
  <div class="post-card" data-id="${post.id}">
    <div class="post-top">
      <div class="post-title">${post.title}</div>
      <div class="post-date">${formatDate(post.createdAt)}</div>
    </div>
    <div class="post-meta">
      <span>좋아요 ${formatNumber(post.likes)}</span>
      <span>댓글 ${formatNumber(post.comments)}</span>
      <span>조회수 ${formatNumber(post.views)}</span>
    </div>
    <div class="post-writer">
      <div class="writer-avatar"></div>
      <span>${post.authorNickname}</span>
    </div>
  </div>
`;
