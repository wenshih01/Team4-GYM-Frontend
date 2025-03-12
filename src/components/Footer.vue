<template>
    <footer class="footer">
        <!-- 左側版權資訊 -->
        <div class="footer-left">
            <h2>GYM</h2>
            <p>© 2024 GYM, Inc. All Rights Reserved.</p>
        </div>


        <div class="footer-contact">
            <p>02-1234-5678</p>
            <p>contact@gym.com</p>
            <p>台北市中正區忠孝東路一段100號</p>
        </div>

        <!-- 右側社交媒體 -->
        <div class="footer-social">
            <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
        </div>
    </footer>
</template>

<script>
export default {
    name: "Footer",
};
</script>

<style scoped>
.footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #1e1e1e;
    color: white;
    gap: 20px;
    font-family: "Montserrat", serif;
    font-weight: 100;
    position: relative;
    bottom: 0;
    width: 100%;
    max-width: 100vw;
    margin: 0 auto;
    padding: 0 10px;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
}

/* 左側版權資訊 */
.footer-left h2 {
    font-size: 20px;
    color: #ff961e;
    margin: 0;
}

.footer-left p {
    font-size: 14px;
    margin: 5px 0 0;
    color: #ccc;
}

.footer-contact {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    /* 左對齊 */
    font-size: 14px;
    line-height: 1;
    color: #ccc;
    margin-left: 0px;

}

.footer-social a {
    text-decoration: none;
    color: white;
    font-size: 18px;
    margin-left: 15px;
    transition: color 0.3s;
}

.footer-social a:hover {
    color: #ff961e;
}
</style>