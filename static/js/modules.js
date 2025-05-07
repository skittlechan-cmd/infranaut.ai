document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.module-tabs .tabs li');
    const tabContents = document.querySelectorAll('.module-content');
    const tabList = document.querySelector('.module-tabs .tabs ul');

    // Initialize first tab as active
    if (tabs.length > 0) {
        tabs[0].classList.add('is-active');
        const firstTabId = tabs[0].dataset.tab;
        document.getElementById(firstTabId).classList.add('active');
    }

    // Smooth scrolling for mobile tab list
    if (tabList) {
        let isScrolling = false;
        let startX;
        let scrollLeft;

        tabList.addEventListener('mousedown', (e) => {
            isScrolling = true;
            startX = e.pageX - tabList.offsetLeft;
            scrollLeft = tabList.scrollLeft;
        });

        tabList.addEventListener('mouseleave', () => {
            isScrolling = false;
        });

        tabList.addEventListener('mouseup', () => {
            isScrolling = false;
        });

        tabList.addEventListener('mousemove', (e) => {
            if (!isScrolling) return;
            e.preventDefault();
            const x = e.pageX - tabList.offsetLeft;
            const walk = (x - startX) * 2;
            tabList.scrollLeft = scrollLeft - walk;
        });
    }

    // Tab switching logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;

            // Remove active classes
            tabs.forEach(t => t.classList.remove('is-active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active classes
            tab.classList.add('is-active');
            document.getElementById(targetId).classList.add('active');

            // On mobile, ensure the selected tab is visible
            if (window.innerWidth <= 768) {
                const tabRect = tab.getBoundingClientRect();
                const tabListRect = tabList.getBoundingClientRect();

                if (tabRect.right > tabListRect.right) {
                    tabList.scrollLeft += tabRect.right - tabListRect.right + 16;
                } else if (tabRect.left < tabListRect.left) {
                    tabList.scrollLeft -= tabListRect.left - tabRect.left + 16;
                }
            }
        });
    });
});