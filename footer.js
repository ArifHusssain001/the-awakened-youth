// Injects the footer partial into the page. Include with: <script defer src="js/footer.js"></script>
(function(){
  function buildFooter(){
    var footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.setAttribute('role','contentinfo');
    var year = new Date().getFullYear();
    footer.innerHTML = `
      <div class="footer-top">
        <div class="footer-grid">
          <div class="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="about.html">About the Writer</a></li>
              <li><a href="columns.html">Latest Columns</a></li>
              <li><a href="feedback.html">Q&A Section</a></li>
              <li><a href="contact.html">Get in Touch</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>For Writers</h4>
            <ul>
              <li><a href="register.html">Join as Writer</a></li>
              <li><a href="login.html">Writer Login</a></li>
              <li><a href="writer-dashboard.html">Writer Dashboard</a></li>
              <li><a href="admin.html">Admin Panel</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="https://quran.com" target="_blank">Read Quran Online</a></li>
              <li><a href="https://sunnah.com" target="_blank">Hadith Collection</a></li>
              <li><a href="https://islamqa.info" target="_blank">Islamic Q&A</a></li>
              <li><a href="feedback.html">Ask Questions</a></li>
            </ul>
          </div>
          <div class="footer-col follow">
            <h4>Follow us through</h4>
            <a class="mailing" href="#">Or join our mailing list.</a>
            <div class="social-icons" aria-hidden="false">
              <a href="#" aria-label="Facebook" class="icon fb">f</a>
              <a href="#" aria-label="Twitter" class="icon tw">t</a>
              <a href="#" aria-label="WhatsApp" class="icon wa">w</a>
              <a href="#" aria-label="Telegram" class="icon tg">✈</a>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© ${year} The Awakened Youth | Created by Syeda Maha</p>
      </div>
    `;
    document.body.appendChild(footer);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', buildFooter);
  } else { buildFooter(); }
})();

// Small logo fallback: try alternate filename and hide broken image
(function(){
  function handleLogo(img){
    if (!img) return;
    // If the image fails to load, try the original filename with a space once,
    // then fall back to hiding the image and keeping the site title visible.
    img.addEventListener('error', function onErr(){
      // avoid infinite loop
      if (img.dataset.triedAlternate !== '1'){
        img.dataset.triedAlternate = '1';
        // try filename with space (e.g. "logo we.png") in case user didn't rename
        var parts = img.src.split('/');
        parts[parts.length-1] = parts[parts.length-1].replace(/-/g, ' ');
        img.src = parts.join('/');
        return;
      }
      // final fallback: hide broken image and ensure the site title is visible
      img.style.display = 'none';
      var parent = img.parentElement;
      if (parent){
        var title = parent.querySelector('.site-title');
        if (title) title.style.display = 'inline-block';
      }
      img.removeEventListener('error', onErr);
    });
    // if image loads, make sure title remains visible alongside it
    img.addEventListener('load', function(){
      var parent = img.parentElement;
      if (parent){
        var title = parent.querySelector('.site-title');
        if (title) title.style.display = 'inline-block';
      }
    });
  }

  function registerAllLogos(){
    var imgs = document.querySelectorAll('img.site-logo');
    imgs.forEach(handleLogo);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', registerAllLogos);
  } else { registerAllLogos(); }
})();
