import pandas as pd
from django.db import transaction

from tadbirbodjeh.models import relation, organization, program, budget_row


def import_relations_from_excel(file_path):
    # Read the Excel file
    df = pd.read_excel(file_path)

    # Group by budget_row code
    grouped = df.groupby('budget_row_code')

    with transaction.atomic():
        for budget_row_code, group in grouped:
            # Get the budget_row
            try:
                budget_row_obj = budget_row.objects.get(code=budget_row_code)
            except budget_row.DoesNotExist:
                print(f"Budget row with code {budget_row_code} does not exist. Skipping.")
                continue

            # Create or update a relation object
            relation_obj, created = relation.objects.update_or_create(
                year=1403,  # Assuming year is 1403 for all entries
                budget_row=budget_row_obj,
                defaults={
                    'year': 1403,
                    'budget_row': budget_row_obj
                }
            )

            # Add organizations
            org_codes = group['organization_code'].unique()
            for org_code in org_codes:
                try:
                    org_obj = organization.objects.get(code=org_code)
                    relation_obj.organization.add(org_obj)
                except organization.DoesNotExist:
                    print(f"Organization with code {org_code} does not exist. Skipping.")

            # Add programs
            prog_codes = group['program_code'].unique()
            for prog_code in prog_codes:
                try:
                    # Try to convert prog_code to an integer
                    # int_prog_code = int(prog_code)
                    prog_obj = program.objects.get(code=prog_code)
                    relation_obj.programs.add(prog_obj)
                except ValueError:
                    print(f"Invalid program code '{prog_code}'. Skipping.")
                except program.DoesNotExist:
                    print(f"Program with code {prog_code} does not exist. Skipping.")

            action = "Updated" if not created else "Created"
            print(f"Successfully {action} relation for budget row {budget_row_code}")
            print(f"  - Added {len(org_codes)} organizations and {len(prog_codes)} programs")


if __name__ == "__main__":
    excel_file_path = "/home/rashidi/Downloads/list.xlsx"
    import_relations_from_excel(excel_file_path)