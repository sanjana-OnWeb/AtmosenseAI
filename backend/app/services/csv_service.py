
import io
import pandas as pd


def read_valid_csv(file_content: bytes):
    try:
        df = pd.read_csv(io.BytesIO(file_content))

    except (
        pd.errors.EmptyDataError,
        pd.errors.ParserError,
        UnicodeDecodeError
    ):
        raise ValueError("Invalid CSV file. Please upload a valid CSV.")

    except Exception:
        raise ValueError("Unable to read the uploaded CSV file.")

    if df.empty:
        raise ValueError("The uploaded CSV contains no data.")

    if len(df.columns) == 0:
        raise ValueError("The CSV must contain column headers.")

    # Validate column names.
    df.columns = df.columns.astype(str).str.strip()

    if any(not column for column in df.columns):
        raise ValueError("CSV column names cannot be empty.")

    if df.columns.duplicated().any():
        raise ValueError("CSV contains duplicate column names.")

    return df


def inspect_csv(file_content: bytes):
    df = read_valid_csv(file_content)

    columns = [
        {
            "name": str(column),
            "data_type": str(df[column].dtype),
            "missing_values": int(df[column].isna().sum())
        }
        for column in df.columns
    ]

    preview_df = df.head(10).astype(object)
    preview_df = preview_df.where(pd.notna(preview_df), None)

    return {
        "total_rows": int(len(df)),
        "total_columns": int(len(df.columns)),
        "columns": columns,
        "duplicate_rows": int(df.duplicated().sum()),
        "preview": preview_df.to_dict(orient="records")
    }


def preprocess_csv(file_content: bytes):
    df = read_valid_csv(file_content)

    original_rows = len(df)

    processed_df = df.drop_duplicates().copy()

    duplicates_removed = original_rows - len(processed_df)

    numeric_columns = processed_df.select_dtypes(
        include="number"
    ).columns

    missing_values_filled = 0

    for column in numeric_columns:
        missing_count = int(processed_df[column].isna().sum())

        if missing_count > 0:
            median_value = processed_df[column].median()

            if pd.notna(median_value):
                processed_df[column] = processed_df[column].fillna(
                    median_value
                )
                missing_values_filled += missing_count

    remaining_missing_values = int(
        processed_df.isna().sum().sum()
    )

    preview_df = processed_df.head(10).astype(object)
    preview_df = preview_df.where(pd.notna(preview_df), None)

    return {
        "original_rows": int(original_rows),
        "processed_rows": int(len(processed_df)),
        "duplicates_removed": int(duplicates_removed),
        "missing_values_filled": int(missing_values_filled),
        "remaining_missing_values": remaining_missing_values,
        "preview": preview_df.to_dict(orient="records")
    }
