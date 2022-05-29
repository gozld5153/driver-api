import { MigrationInterface, QueryRunner } from "typeorm";

export class addCalculatedAtToInvoicesTalbe1653805605367 implements MigrationInterface {
    name = 'addCalculatedAtToInvoicesTalbe1653805605367'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invoices\` ADD \`calculatedAt\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invoices\` DROP COLUMN \`calculatedAt\``);
    }

}
