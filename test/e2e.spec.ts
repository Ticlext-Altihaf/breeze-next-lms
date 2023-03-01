import { test, expect, Page } from '@playwright/test'
const randomEmail = Math.random().toString(36).substring(2) + '@example.com'
const password = 'password'
const username = 'Test User'

const adminCredentials = {
    email: 'admin@localhost',
    password: 'password',
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
test.use({
    //launchOptions: { slowMo: 250 },
})
test('sanity test', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await expect(page).toHaveURL('http://localhost:3000')
    // The new page should "Login" and "Register" links
    await expect(page.locator('a', { hasText: 'Login' })).toBeVisible()
})

async function register(page, { scenarioWrongPassword = false } = {}) {
    await page.goto('http://localhost:3000/')
    await expect(page).toHaveURL('http://localhost:3000')
    // The new page should "Login" and "Register" links
    await page.getByText('Register').click()
    await expect(page).toHaveURL('http://localhost:3000/register')
    //Username
    await page.keyboard.type(username)
    await page.keyboard.press('Tab')
    //Email
    await page.keyboard.type(randomEmail)
    await page.keyboard.press('Tab')
    //Password
    await page.keyboard.type(password)
    await page.keyboard.press('Tab')
    //Confirm Password
    if (scenarioWrongPassword) {
        await page.keyboard.type('wrongpassword')
    } else {
        await page.keyboard.type(password)
    }
    await page.keyboard.press('Tab')
    //Find button
    await page.getByRole('button').click()
}
test('register', async ({ page }) => {
    await register(page)
    await expect(page).toHaveURL('http://localhost:3000/dashboard')
})

test('register with existing email', async ({ page }) => {
    await register(page)
    await expect(page).toHaveURL('http://localhost:3000/register')
    await expect(
        page.locator('p', { hasText: 'The email has already been taken.' }),
    ).toBeVisible()
})

test('register with wrong password', async ({ page }) => {
    await register(page, { scenarioWrongPassword: true })
    await expect(page).toHaveURL('http://localhost:3000/register')
    await expect(
        page.locator('p', {
            hasText: 'The password confirmation does not match',
        }),
    ).toBeVisible()
})

async function login(page, { scenarioWrongPassword = false } = {}) {
    await page.goto('http://localhost:3000/')
    await expect(page).toHaveURL('http://localhost:3000')
    // The new page should "Login" and "Register" links
    await page.getByText('Login').click()
    await expect(page).toHaveURL('http://localhost:3000/login')
    //Email
    await page.keyboard.type(randomEmail)
    await page.keyboard.press('Tab')
    //Password
    if (scenarioWrongPassword) {
        await page.keyboard.type('wrongpassword')
    } else {
        await page.keyboard.type(password)
    }
    await page.keyboard.press('Tab')
    //Find button
    await page.getByRole('button').click()
    if (scenarioWrongPassword) {
        return
    }
    //wait for redirect to /dashboard
    await sleep(1000)
    await expect(page).toHaveURL('http://localhost:3000/dashboard')
}

test('login', async ({ page }) => {
    await login(page)
})

test('login with wrong password', async ({ page }) => {
    await login(page, { scenarioWrongPassword: true })
    await expect(page).toHaveURL('http://localhost:3000/login')
    await expect(
        page.locator('p', {
            hasText: 'These credentials do not match our records.',
        }),
    ).toBeVisible()
})

test('logout', async ({ page }) => {
    await login(page)
    const navMenu = await page.getByRole('button', { name: username })
    await navMenu.click()
    await page.getByText('Logout').click()
    await expect(page).toHaveURL('http://localhost:3000/login')
})

test('Check content of dashboard', async ({ page }) => {
    await login(page)
    //expect /dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard')
    //wait for loading
    await page.waitForSelector('#__next > div > main > div > div:nth-child(1)')
    //find elements with href startwith /courses/*
    let courses = await page.$$('[href^="/courses/"]')
    expect(courses.length).toBeGreaterThan(0)
    //click on random course
    const randomCourse = courses[Math.floor(Math.random() * courses.length)]
    await randomCourse.click()
    //url should be /courses/*
    await expect(page).toHaveURL(/\/courses\/.*/)
    const courseURL = page.url()
    //wait for loading
    await page.waitForSelector(
        '#__next > div > main > div > div > div > div > a',
    )
    //find elements with href has lessons
    const lessons = await page.$$('a[href*="lessons"]')
    expect(lessons.length).toBeGreaterThan(0)
    //click on random lesson
    const randomLesson = lessons[Math.floor(Math.random() * lessons.length)]
    await randomLesson.click()
    //url should be /courses/*/lessons/*/*
    await expect(page).toHaveURL(/\/courses\/.*\/lessons\/.*/)
    //wait for loading
    const lessonContentSelector = '#content'
    //find button with "Next" or "Finish" text
    while (page.url().includes('lessons')) {
        await page.waitForSelector(lessonContentSelector)
        let nextButton = await page.getByRole('button', { name: 'Next' })
        if (!(await nextButton.isVisible())) {
            nextButton = await page.getByRole('button', { name: 'Finish' })
        }
        if (!(await nextButton.isVisible())) {
            //just find any button
            nextButton = page.getByTestId('answer-0')
        }
        //check if there input with type text
        const inputText = await page.$('input[type="text"]')
        if (inputText) {
            //type random text
            await inputText.type(Math.random().toString(36).substring(2))
        }
        await nextButton.click()
        await sleep(100)
    }
    //url should be /courses/*
    await expect(page).toHaveURL(courseURL)
})
