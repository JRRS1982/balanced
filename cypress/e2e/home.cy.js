describe('Home Page', () => {
  it('successfully loads', () => {
    cy.visit('/');
    cy.title().should('include', 'Create Next App');
    // Or check for any element that actually exists on the page
    cy.get('a[href*="nextjs.org"]').should('exist');
  });
});
