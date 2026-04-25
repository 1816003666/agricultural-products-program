// 图片懒加载指令
export const lazyLoad = {
  mounted(el, binding) {
    // 保存原始图片地址
    el.dataset.src = binding.value;
    
    // 设置默认占位图
    el.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50%" y="50%" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle" dy=".3em"%3E加载中...%3C/text%3E%3C/svg%3E';
    
    // 检查是否支持IntersectionObserver
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 图片进入视口，加载真实图片
            el.src = el.dataset.src;
            // 加载完成后停止观察
            observer.unobserve(el);
          }
        });
      }, {
        rootMargin: '0px 0px 200px 0px' // 提前200px开始加载
      });
      
      observer.observe(el);
      el._observer = observer;
    } else {
      // 不支持IntersectionObserver的浏览器，直接加载图片
      el.src = el.dataset.src;
    }
  },
  unmounted(el) {
    // 清理观察器
    if (el._observer) {
      el._observer.unobserve(el);
    }
  }
};