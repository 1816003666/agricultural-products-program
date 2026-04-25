<script setup></script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">农产品直销</h3>
          <p class="footer-description">
            农场直供 | 北京市朝阳区农产品批发市场
          </p>
          <p class="footer-description">仓库地址：北京市朝阳区建国路88号</p>
          <p class="footer-description">客服热线：400-123-4567</p>
        </div>

        <div class="footer-section">
          <h4 class="footer-subtitle">快速链接</h4>
          <ul class="footer-links">
            <li><a href="/" class="footer-link">首页</a></li>
            <li><a href="#" class="footer-link">分类</a></li>
            <li><a href="#" class="footer-link">关于我们</a></li>
            <li><a href="#" class="footer-link">售后</a></li>
            <li><a href="#" class="footer-link">FAQ</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4 class="footer-subtitle">支付方式</h4>
          <div class="payment-methods">
            <div class="payment-method">微信支付</div>
            <div class="payment-method">支付宝</div>
            <div class="payment-method">银行卡</div>
          </div>
        </div>

        <div class="footer-section">
          <h4 class="footer-subtitle">配送范围</h4>
          <p class="footer-description">全国配送，部分偏远地区除外</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copyright">©2026 农产品直销 保留所有权利</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #333;
  color: white;
  padding: 2rem 0;
  margin-top: 2rem;
}

.container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
}

.footer-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  color: #2eac70;
}

.footer-subtitle {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.footer-description {
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
  color: #ddd;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-link {
  color: #ddd;
  text-decoration: none;
  transition: color 0.3s;
  font-size: 0.875rem;
}

.footer-link:hover {
  color: #2eac70;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
  text-align: center;
}

.footer-copyright {
  font-size: 0.75rem;
  color: #999;
  margin: 0;
}

.payment-methods {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.payment-method {
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.875rem;
  color: #ddd;
  transition: all 0.3s;
}

.payment-method:hover {
  background-color: rgba(46, 172, 112, 0.3);
  color: white;
}

@media (max-width: 500px) {
  .footer {
    padding: 1.5rem 0;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .footer-bottom {
    padding-top: 1rem;
  }
}
</style>
